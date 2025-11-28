import { listMeals } from "@/app/actions/meals";
import { PageContainer } from "@/components/common/PageContainer";
import { Navbar } from "@/components/common/Navbar";
import { MealList, type Meal } from "@/components/history/MealList";

export default async function HistoryPage() {
  const result = await listMeals();
  const meals = (result.success && result.data ? result.data : []) as Array<Meal>;

  return (
    <>
      <Navbar />
      <PageContainer className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Meal History</h1>
        <MealList meals={meals} />
      </PageContainer>
    </>
  );
}

