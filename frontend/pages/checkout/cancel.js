import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { useRouter } from "next/router";

export default function CheckoutCancel() {
  const router = useRouter();

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", px: 3, py: 8, textAlign: "center" }}>
      <Card>
        <CardContent sx={{ py: 5 }}>
          <Typography variant="h4" gutterBottom>
            Checkout canceled
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            No charge was made. Head back whenever you're ready to try again.
          </Typography>
          <Button variant="contained" onClick={() => router.push("/")}>
            Back to gigs
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
