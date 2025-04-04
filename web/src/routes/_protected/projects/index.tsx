import {DataTable} from '@/components/data-table/data-table';
import {CreateProjectDialog} from '@/components/dialogs/create-project-dialog';
import {columns} from '@/components/tables/projects';
import {useAuth} from '@/context/auth-provider';
import {useGetProjects} from '@/hooks/get-hooks';
import {createFileRoute, useNavigate} from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/projects/')({
  component: RouteComponent,
});

/**
 * RouteComponent component renders the projects page.
 * It displays a table with the user's projects.
 *
 * @returns {JSX.Element} The rendered RouteComponent component.
 */
function RouteComponent() {
  const {user} = useAuth();

  const {isPending, data} = useGetProjects(user);

  const navigate = useNavigate();

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        loading={isPending}
        onRowClick={({project_id}) => navigate({to: `/projects/${project_id}`})}
        button={<CreateProjectDialog />}
      />
    </>
  );
}
