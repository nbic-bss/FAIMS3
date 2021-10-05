/*
 * Copyright 2021 Macquarie University
 *
 * Licensed under the Apache License Version 2.0 (the, "License");
 * you may not use, this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND either express or implied.
 * See, the License, for the specific language governing permissions and
 * limitations under the License.
 *
 * Filename: E2ETest.java
 * Description:
 *   TODO
 */
package org.fedarch.faims3;

import org.json.JSONException;

public interface E2ETest {

	public boolean isUsingBrowserstack();

	/**
	 * Load up new Test observation form
	 */
	void loadNewAstroSkyForm();

	/**
	 * Validate the lat long values generated by "Take Point" button.
	 */
	void validateLatLong();

	/**
	 * Fill out all fields in test AsTRoSkY form with valid values.
	 */
	void fillOutFormWithValidFields();

	/**
	 * Get a string representation of the driver's location latitude.
     *
	 * @return Longitude string
	 */
	String getLatitude();

	/**
	 * Get a string representation of the driver's location longitude.
	 *
	 * @return Longitude string
	 */
	String getLongitude();

	/**
	 * Validate JSON values on the app
	 * @throws JSONException
	 * @throws AssertionError
	 */
	void validateJSON() throws JSONException, AssertionError;

	/**
	 * Check the message on the top of the app against the string.
	 * @param message String to check against
	 */
	void verifyMessage(String message);

}