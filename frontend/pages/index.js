import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { fetchGigs, startCheckout } from "../config/requests";

const CATEGORIES = ["Tutoring", "Haircut", "Nails", "Cleaning", "Other"];
const LOCATIONS = [
  { label: "Anywhere", value: "" },
  { label: "On-Campus", value: "on_campus" },
  { label: "Off-Campus", value: "off_campus" },
];

const money = (cents) => `$${((cents || 0) / 100).toFixed(2)}`;

export default function ExplorePage() {
  const { enqueueSnackbar } = useSnackbar();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchGigs({ category, location, maxPrice });
      setGigs(data || []);
    } catch (error) {
      enqueueSnackbar(error?.message || "Couldn't load gigs", {
        variant: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hire = async (gigId) => {
    setBusyId(gigId);
    try {
      const url = await startCheckout(gigId);
      window.location.href = url;
    } catch (error) {
      enqueueSnackbar(error?.message || "Couldn't start checkout", {
        variant: "error",
      });
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: 3, py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Gig Explorer
        </Typography>
        <Typography color="text.secondary">Connect. Offer. Succeed.</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
          justifyContent: "center",
        }}
      >
        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {LOCATIONS.map((l) => (
            <MenuItem key={l.label} value={l.value}>
              {l.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Max price ($)"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          sx={{ minWidth: 140 }}
        />
        <Button variant="contained" onClick={load}>
          Filter
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : gigs.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
          No gigs yet. Be the first to list one.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {gigs.map((gig) => (
            <Grid item xs={12} sm={6} md={4} key={gig.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                    {gig.category && <Chip size="small" label={gig.category} />}
                    {gig.location && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={gig.location === "on_campus" ? "On-Campus" : "Off-Campus"}
                      />
                    )}
                  </Box>
                  <Typography variant="h6">{gig.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {gig.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    by {gig.first_name} {gig.last_name}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                  <Typography variant="h6">{money(gig.price_cents)}</Typography>
                  <Button
                    variant="contained"
                    disabled={busyId === gig.id}
                    onClick={() => hire(gig.id)}
                  >
                    {busyId === gig.id ? "Redirecting..." : "Hire"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
