import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { startOnboarding, fetchConnectStatus } from "../../config/requests";

export default function OnboardPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const s = await fetchConnectStatus();
      setStatus(s);
    } catch (error) {
      enqueueSnackbar(error?.message || "Couldn't load onboarding status", {
        variant: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const begin = async () => {
    setStarting(true);
    try {
      const url = await startOnboarding();
      window.location.href = url;
    } catch (error) {
      enqueueSnackbar(error?.message || "Couldn't start onboarding", {
        variant: "error",
      });
      setStarting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", px: 3, py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Become a seller
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Set up payouts with Stripe so you can get paid for your gigs. Hustle
        keeps a 10% platform fee on each sale.
      </Typography>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card>
          <CardContent>
            {status?.charges_enabled ? (
              <>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your account is ready to accept payments.
                </Alert>
                <Button
                  variant="contained"
                  onClick={() => router.push("/sell/create")}
                >
                  Create a gig
                </Button>
              </>
            ) : status?.details_submitted ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Stripe is still verifying your details. This can take a moment.
                </Alert>
                <Button variant="outlined" onClick={refresh}>
                  Refresh status
                </Button>
              </>
            ) : (
              <>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You haven't finished onboarding yet.
                </Alert>
                <Button variant="contained" onClick={begin} disabled={starting}>
                  {starting ? "Redirecting..." : "Start onboarding"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
