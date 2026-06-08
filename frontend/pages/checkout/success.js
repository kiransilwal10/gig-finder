import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { useRouter } from "next/router";

export default function CheckoutSuccess() {
  const router = useRouter();

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", px: 3, py: 8, textAlign: "center" }}>
      <Card>
        <CardContent sx={{ py: 5 }}>
          <Typography variant="h4" gutterBottom>
            Payment successful
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Thanks for your purchase. The seller has been paid their share
            automatically.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="contained" onClick={() => router.push("/purchases")}>
              My purchases
            </Button>
            <Button variant="outlined" onClick={() => router.push("/")}>
              Back to gigs
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
