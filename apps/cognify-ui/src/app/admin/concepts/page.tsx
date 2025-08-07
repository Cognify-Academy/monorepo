import { ConceptGraphEditor } from "@/components/concept-graph-editor";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function AdminConceptsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />

      <main className="w-full flex-1">
        <ConceptGraphEditor />
      </main>

      <Footer />
    </div>
  );
}
