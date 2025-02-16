import FamilyRegistrationForm from './components/FamilyRegistrationForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Family Meal Planner
        </h1>
        <FamilyRegistrationForm />
      </div>
    </main>
  );
}
