import { useState, useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import Dashboard from "@/components/Dashboard";
import ExpenseForm from "@/components/ExpenseForm";
import EarningForm from "@/components/EarningForm";
import ProjectSelector from "@/components/ProjectSelector";
import SharedItemView from "@/components/SharedItemView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import {
  getExpenses,
  getEarnings,
  addExpense,
  addEarning,
  updateExpense,
  updateEarning,
  deleteExpense,
  deleteEarning,
  getProjectById,
} from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedItem, setSharedItem] = useState<{
    type: "expense" | "earning";
    id: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadSavedProject = async () => {
      const savedProjectId = localStorage.getItem("currentProjectId");
      if (savedProjectId) {
        try {
          const project = await getProjectById(savedProjectId);
          if (project) {
            setCurrentProject(project);
            await loadProjectData(project.id);
          }
        } catch (error) {
          console.error("Error loading saved project:", error);
        }
      }
      setIsLoading(false);
    };

    loadSavedProject();
    checkForSharedItem(); // Update for shared item handling
  }, []);

  const checkForSharedItem = () => {
    const path = window.location.pathname; // Get the full path
    const pathParts = path.split("/"); // Split the path by "/"

    // Expecting URL like /share/type/id
    if (pathParts[1] === "share" && pathParts.length === 4) {
      const type = pathParts[2];
      const id = parseInt(pathParts[3], 10);

      if ((type === "expense" || type === "earning") && !isNaN(id)) {
        setSharedItem({ type, id });
      }
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      const [projectExpenses, projectEarnings] = await Promise.all([
        getExpenses(projectId),
        getEarnings(projectId),
      ]);
      setExpenses(projectExpenses);
      setEarnings(projectEarnings);
    } catch (error) {
      console.error("Error loading project data:", error);
      toast({
        title: "Error",
        description: "Failed to load project data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleProjectChange = (project: Project) => {
    setCurrentProject(project);
    loadProjectData(project.id);
    localStorage.setItem("currentProjectId", project.id);
  };

  const handleAddExpense = async (
    newExpense: Omit<Expense, "id" | "project_id">
  ) => {
    if (currentProject) {
      try {
        const addedExpense = await addExpense({
          ...newExpense,
          project_id: currentProject.id,
        });
        setExpenses([...expenses, addedExpense]);
        toast({
          title: "Expense Added",
          description: `${newExpense.name} - $${newExpense.amount}`,
        });
      } catch (error) {
        console.error("Error adding expense:", error);
        toast({
          title: "Error",
          description: "Failed to add expense. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddEarning = async (
    newEarning: Omit<Earning, "id" | "project_id">
  ) => {
    if (currentProject) {
      try {
        const addedEarning = await addEarning({
          ...newEarning,
          project_id: currentProject.id,
        });
        setEarnings([...earnings, addedEarning]);
        toast({
          title: "Earning Added",
          description: `${newEarning.name} - $${newEarning.amount}`,
        });
      } catch (error) {
        console.error("Error adding earning:", error);
        toast({
          title: "Error",
          description: "Failed to add earning. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (sharedItem) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SharedItemView itemType={sharedItem.type} itemId={sharedItem.id} />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="container mx-auto p-4">
        <header className="flex flex-wrap justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Tracker</h1>
          <div className="flex flex-wrap items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <ProjectSelector
              onProjectChange={handleProjectChange}
              currentProject={currentProject}
            />
            <ModeToggle />
          </div>
        </header>

        {currentProject ? (
          <Tabs defaultValue="dashboard">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="add-expense"> Neue Ausgabe</TabsTrigger>
              <TabsTrigger value="add-earning">Neue Einnahme</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Dashboard
                expenses={expenses}
                earnings={earnings}
                onUpdateExpense={(updatedExpense) => {
                  updateExpense(updatedExpense).then(() => {
                    setExpenses(
                      expenses.map((e) =>
                        e.id === updatedExpense.id ? updatedExpense : e
                      )
                    );
                  });
                }}
                onUpdateEarning={(updatedEarning) => {
                  updateEarning(updatedEarning).then(() => {
                    setEarnings(
                      earnings.map((e) =>
                        e.id === updatedEarning.id ? updatedEarning : e
                      )
                    );
                  });
                }}
                onRemoveExpense={(id) => {
                  deleteExpense(id).then(() => {
                    setExpenses(expenses.filter((e) => e.id !== id));
                  });
                }}
                onRemoveEarning={(id) => {
                  deleteEarning(id).then(() => {
                    setEarnings(earnings.filter((e) => e.id !== id));
                  });
                }}
              />
            </TabsContent>
            <TabsContent value="add-expense">
              <ExpenseForm onAddExpense={handleAddExpense} />
            </TabsContent>
            <TabsContent value="add-earning">
              <EarningForm onAddEarning={handleAddEarning} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center">
            <p>
              Bitte wähle ein Projekt aus, oder starte ein neues um zu starten.
            </p>
          </div>
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
