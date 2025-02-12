import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductVariants() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Variant</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Brown</TableCell>
          <TableCell>WALLET-001-BR</TableCell>
          <TableCell>$79.99</TableCell>
          <TableCell>250</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Black</TableCell>
          <TableCell>WALLET-001-BL</TableCell>
          <TableCell>$79.99</TableCell>
          <TableCell>273</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
