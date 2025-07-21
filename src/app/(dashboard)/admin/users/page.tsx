
import { getAdminDashboardData } from "@/app/actions/admin-actions";
import { UsersClientPage } from "./users-client-page";


export default async function AdminUsersPage() {
    const data = await getAdminDashboardData();

    return (
        <UsersClientPage initialUsers={data.users} />
    );
}
