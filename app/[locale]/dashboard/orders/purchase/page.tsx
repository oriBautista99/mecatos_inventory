import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-lg font-bold uppercase">Ordenes de Compra</h1>
      <Card>
          <div className="p-4">
            Filter
          </div>
      </Card>
      
    </div>
  );
}
