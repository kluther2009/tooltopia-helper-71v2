import { Table, TableBody } from "@/components/ui/table";
import { ToolTableHeader } from "./table/TableHeader";
import { ToolTableRow } from "./table/ToolTableRow";
import { useToolTable } from "./table/useToolTable";

export function ToolListTable() {
  const {
    tools,
    sortConfig,
    handleSort,
    openFile
  } = useToolTable();

  return (
    <div className="bg-card rounded-lg shadow-md border border-border">
      <div className="overflow-x-auto">
        <Table>
          <ToolTableHeader 
            onSort={handleSort}
            sortConfig={sortConfig}
          />
          <TableBody>
            {tools.map((tool) => (
              <ToolTableRow
                key={tool.id}
                tool={tool}
                onFileClick={openFile}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}