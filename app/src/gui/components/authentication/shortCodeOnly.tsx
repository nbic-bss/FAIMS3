import {Browser} from '@capacitor/browser';
import {ListingsObject} from '@faims3/data-model/src/types';
import LoginIcon from '@mui/icons-material/Login';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  useTheme,
} from '@mui/material';
import React, {useContext, useState} from 'react';
import {APP_ID} from '../../../buildconfig';
import {ActionType} from '../../../context/actions';
import {useNotification} from '../../../context/popup';
import {store} from '../../../context/store';
import {isWeb} from '../../../utils/helpers';
import {QRCodeButton} from '../../fields/qrcode/QRCodeFormField';

/**
 * Component to register a button for scanning a QR code to register
 * for a notebook
 * @param props Component properties include only `listings`
 * @returns component content
 */
export function QRCodeButtonOnly(props: {listings: ListingsObject[]}) {
  const {dispatch} = useContext(store);
  const theme = useTheme();
  const handleRegister = async (url: string) => {
    // verify that this URL is one that's going to work
    // valid urls look like:
    // http://192.168.1.2:8154/register/DEV-TMKZSM
    const valid_hosts = props.listings.map(listing => listing.conductor_url);
    const valid_re = valid_hosts.join('|') + '/register/.*-[A-Z1-9]+';

    if (url.match(valid_re)) {
      // Use the capacitor browser plugin in apps
      await Browser.open({
        url: `${url}?redirect=${APP_ID}://auth-return`,
      });
    } else {
      dispatch({
        type: ActionType.ADD_ALERT,
        payload: {
          message: 'Invalid QRCode Scanned',
          severity: 'warning',
        },
      });
    }
  };

  return (
    <QRCodeButton
      label={'Scan QR Code'}
      onScanResult={handleRegister}
      buttonProps={{
        variant: 'outlined',
        fullWidth: true,
        startIcon: <QrCodeScannerIcon />,
        sx: {
          borderRadius: '12px',
          padding: '12px 20px',
          textTransform: 'none',
          fontSize: '1rem',
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          borderWidth: '1.5px',
          marginTop: -1,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            borderWidth: '1.5px',
            backgroundColor: 'rgba(118, 184, 42, 0.04)',
          },
        },
      }}
    ></QRCodeButton>
  );
}

interface ShortCodeOnlyComponentProps {
  listings: ListingsObject[];
}
export const ShortCodeOnlyComponent = (props: ShortCodeOnlyComponentProps) => {
  /**
    Component: ShortCodeOnlyComponent
    
    */

  const [shortCode, setShortCode] = useState('');
  const {showSuccess, showError, showInfo} = useNotification();
  const [selectedPrefix, setSelectedPrefix] = useState(
    props.listings[0]?.prefix || ''
  );

  // pattern for allowed short codes (excluding prefix, 0, O, and dash)
  const codeChars = '^[ABCDEFGHIJKLMNPQRSTUVWXYZ123456789]*$';

  /**
   * Processes input to handle prefixes and maintain valid short code format
   *
   * Also strips any whitespace.
   *
   * @param input The raw input string to process
   * @returns The cleaned short code without prefix or whitespace
   */
  const processInput = (input: string): string => {
    const cleanInput = input.toUpperCase().trim();

    // Check if input starts with any known prefix (including potential dash)
    for (const prefix of props.listings.map(listing => listing.prefix)) {
      const prefixPattern = new RegExp(`^${prefix}-?`);
      if (prefixPattern.test(cleanInput)) {
        // If found, update selected prefix and remove it from input
        setSelectedPrefix(prefix);
        showInfo(`Prefix "${prefix}" detected and selected automatically`);
        return cleanInput.replace(prefixPattern, '');
      }
    }

    return cleanInput;
  };

  const updateShortCode = (event: {
    target: {value: React.SetStateAction<string>};
  }) => {
    const rawValue = event.target.value as string;
    const processedValue = processInput(rawValue);

    if (processedValue.length > 6) {
      showError('Code must be exactly six characters');
    } else if (!processedValue.match(codeChars)) {
      showError('Invalid characters detected');
    } else {
      setShortCode(processedValue);
    }
  };

  const handlePrefixChange = (event: SelectChangeEvent<string>) => {
    setSelectedPrefix(event.target.value);
  };

  const handleRegister = async () => {
    if (shortCode.length !== 6) {
      showError('Please enter a valid 6-character code');
      return;
    }

    const listing_info = props.listings.find(
      listing => listing.prefix === selectedPrefix
    );

    if (!listing_info) {
      showError('Invalid prefix selected');
      return;
    }

    const url =
      listing_info.conductor_url +
      '/register/' +
      listing_info.prefix +
      '-' +
      shortCode;

    showSuccess('Initiating registration...');

    if (isWeb()) {
      const redirect = `${window.location.protocol}//${window.location.host}/auth-return`;
      window.location.href = url + '?redirect=' + redirect;
    } else {
      await Browser.open({
        url: `${url}?redirect=${APP_ID}://auth-return`,
      });
    }
  };

  // only show the prefix selection dropdown if
  const showPrefixSelector = props.listings.length > 1;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {
        // Only show selector if condition is true i.e. more than one listing
      }
      {showPrefixSelector && (
        <FormControl sx={{minWidth: 80, maxWidth: 120}}>
          <InputLabel id="prefix-label" sx={{backgroundColor: 'white', px: 1}}>
            Prefix
          </InputLabel>
          <Select
            labelId="prefix-label"
            value={selectedPrefix}
            onChange={handlePrefixChange}
            size="small"
          >
            {props.listings.map(listing => (
              <MenuItem key={listing.prefix} value={listing.prefix}>
                {listing.prefix}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <TextField
        value={shortCode}
        placeholder="Enter code"
        variant="outlined"
        onChange={updateShortCode}
        size="small"
        fullWidth
        InputProps={{
          sx: {fontFamily: 'monospace'},
          startAdornment: (
            <InputAdornment position="start">{selectedPrefix} -</InputAdornment>
          ),
        }}
      />

      <Button
        onClick={handleRegister}
        variant="outlined"
        startIcon={<LoginIcon />}
        disabled={shortCode.length !== 6}
        sx={{
          minWidth: '100px',
          height: '40px',
          bgcolor: 'grey.100',
        }}
      >
        Submit
      </Button>
    </Stack>
  );
};