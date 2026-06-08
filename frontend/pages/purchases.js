import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { fetchMyOrders } from "../config/requests";

const money = (cents) => `$${((cents || 0) / 100).toFixed(2)}`;

const statusColor = (s) =>
  s === "paid" ? "success" : s === "refunded" ? "default" : "warning";

export default function PurchasesPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyOrders();
        setOrders(data || []);
      } catch (error) {
        enqueueSnackbar(error?.message || "Couldn't load purchases", {
          variant: "error",
        });
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 3, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        My purchases
      </Typography>
      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography color="text.secondary">
          You haven't bought any gigs yet.
        </Typography>
      ) : (
        <Card>
          <CardContent>
            {orders.map((o, i) => (
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
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
