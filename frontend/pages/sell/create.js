import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { createGig } from "../../config/requests";

const CATEGORIES = ["Tutoring", "Haircut", "Nails", "Cleaning", "Other"];

export default function CreateGigPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tutoring");
  const [location, setLocation] = useState("on_campus");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createGig({
        title,
        description,
        category,
        location,
        price: parseFloat(price),
      });
      enqueueSnackbar("Gig published", { variant: "success" });
      router.push("/sell/dashboard");
    } catch (error) {
      enqueueSnackbar(error?.message || "Couldn't create gig", {
        variant: "error",
      });
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: "auto", px: 3, py: 5 }}>
      <Typography variant="h4" gutterBottom>
        Create a gig
      </Typography>
      <Card>
        <CardContent>
          <Box
            component="form"
            onSubmit={submit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={saving}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              disabled={saving}
            />
            <TextField
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={saving}
            >
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
              disabled={saving}
            >
              <MenuItem value="on_campus">On-Campus</MenuItem>
              <MenuItem value="off_campus">Off-Campus</MenuItem>
            </TextField>
            <TextField
              label="Price ($)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={saving}
              inputProps={{ min: 1, step: "0.01" }}
            />
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Publish gig"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
