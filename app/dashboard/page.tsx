import { saveUser } from "@/actions";
import Documents from "@/components/Documents";


export const dynamic = "force-dynamic";



const Dashboard = async () => {
  await saveUser();
  return (
    <div className="h-full max-w-7xl mx-auto">
      <h1 className="text-3xl p-5 bg-gray-100 font-extralight">My Documents</h1>
      <Documents />
    </div>
  );
};

export default Dashboard;
