import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getProjects, addProject } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";

interface ProjectSelectorProps {
  onProjectChange: (project: Project) => void;
  currentProject: Project | null;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  onProjectChange,
  currentProject,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const loadedProjects = await getProjects();
      setProjects(loadedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddProject = async () => {
    if (newProjectName.trim()) {
      try {
        const newProject = await addProject(newProjectName.trim());
        setProjects([...projects, newProject]);
        setNewProjectName("");
        setIsDialogOpen(false);
        toast({
          title: "Projekt Hinzugefügt",
          description: `${newProjectName} wurde erfolgreich hinzugefügt.`,
        });
      } catch (error) {
        console.error("Error adding project:", error);
        toast({
          title: "Error",
          description: "Failed to add project. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentProject?.id}
        onValueChange={(value) =>
          onProjectChange(projects.find((p) => p.id === value)!)
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Projekt auswählen" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Projekt hinzufügen</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Projekt hinzufügen</DialogTitle>
          </DialogHeader>
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Projekt Namen eingeben"
          />
          <Button onClick={handleAddProject}>Projekt hinzufügen</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectSelector;
