
import NewCount from "./newCount";

export default async function Page() {

    return(
        <div className="bg-background md:p-5 lg:p-6 xl:p-8 2xl:p-0 2xl:py-8">
           <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
                <NewCount></NewCount> 
           </div>
        </div>
    );
}