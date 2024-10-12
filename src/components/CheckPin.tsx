import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PinAccessComponentProps {
  correctPin: string;
  onAccess: () => void; // Prop zur Callback-Funktion hinzufügen
}

const PinAccessComponent: React.FC<PinAccessComponentProps> = ({
  correctPin,
  onAccess,
}) => {
  const [inputPin, setInputPin] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedPin = localStorage.getItem("userPin");
    const savedTimestamp = localStorage.getItem("pinTimestamp");

    if (savedPin && savedTimestamp) {
      const now = Date.now();
      const isValid = now - Number(savedTimestamp) < 24 * 60 * 60 * 1000; // 24 Stunden in Millisekunden
      if (isValid && savedPin === correctPin) {
        onAccess(); // Zugriff gewähren, wenn die gespeicherte PIN gültig ist
      }
    }
  }, [correctPin, onAccess]);

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPin(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === correctPin) {
      // PIN speichern
      localStorage.setItem("userPin", inputPin);
      localStorage.setItem("pinTimestamp", Date.now().toString());
      onAccess(); // Zugriff gewähren
    } else {
      toast({
        title: "Fehler",
        description: "Falsche PIN. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-100 md:w-[30%]">
      <CardHeader>
        <CardTitle>PIN Eingabe erforderlich</CardTitle>
        <CardDescription>
          Bitte gebe eine gültige PIN ein, um fortzufahren.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                type="password"
                value={inputPin}
                onChange={handlePinChange}
                required
                placeholder="Gültige PIN"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Absenden</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PinAccessComponent;
