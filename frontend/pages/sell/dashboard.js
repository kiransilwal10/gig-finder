import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import {
  fetchEarnings,
  fetchMySales,
  fetchConnectStatus,
  fetchDashboardLink,
} from "../../config/requests";

const money = (cents) => `$${((cents || 0) / 100).toFixed(2)}`;

const statusColor = (s) =>
  s === "paid" ? "success" : s === "refunded" ? "default" : "warning";

const StatCard = ({ label, value }) => (
  <Card>
    <CardContent>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h5">{value}</Typography>
    </CardContent>
  </Card>
);

export default function SellerDashboard() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [earnings, setEarnings] = useState(null);
  const [sales, setSales] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [e, s, st] = await Promise.all([
        fetchEarnings(),
        fetchMySales(),
        fetchConnectStatus(),
      ]);
      setEarnings(e);
      setSales(s || []);
      setStatus(st);
    } catch (error) {
      enqueueSnackbar(error?.message || "Couldn't load your dashboard", {
        variant: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPayouts = async () => {
    try {
      const url = await fetchDashboardLink();
      window.location.href = url;
    } catch (error) {
      enqueueSnackbar(error?.message || "Couldn't open payouts", {
        variant: "error",
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4">Seller dashboard</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" onClick={() => router.push("/sell/create")}>
            New gig
          </Button>
          {status?.charges_enabled && (
            <Button variant="contained" onClick={openPayouts}>
              View payouts
            </Button>
          )}
        </Box>
      </Box>

      {!status?.charges_enabled && (
        <Card sx={{ mb: 3, bgcolor: "#fff8e1" }}>
          <CardContent
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography>
              Finish seller onboarding to start accepting payments.
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push("/sell/onboard")}
            >
              Finish onboarding
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard label="Sales" value={earnings?.paid_count ?? 0} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Gross" value={money(earnings?.gross_cents)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Platform fees" value={money(earnings?.fees_cents)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard label="Net earnings" value={money(earnings?.net_cents)} />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Recent sales
      </Typography>
      <Card>
        <CardContent>
          {sales.length === 0 ? (
            <Typography color="text.secondary">No sales yet.</Typography>
          ) : (
            sales.map((o, i) => (
              <Box key={o.id}>
                {i > 0 && <Divider sx={{ my: 1.5 }} />}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography>{o.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(o.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography>{money(o.amount_cents)}</Typography>
                    <Chip
                      size="small"
                      label={o.status}
                      color={statusColor(o.status)}
                    />
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
