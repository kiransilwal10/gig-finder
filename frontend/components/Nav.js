import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";

export default function Nav() {
  const router = useRouter();
  const go = (path) => () => router.push(path);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: "pointer" }}
          onClick={go("/")}
        >
          Hustle
        </Typography>
        <Button onClick={go("/")}>Explore</Button>
        <Button onClick={go("/sell/dashboard")}>Sell</Button>
        <Button onClick={go("/purchases")}>Purchases</Button>
        <Button variant="outlined" onClick={go("/login")}>
          Log in
        </Button>
      </Toolbar>
    </AppBar>
  );
}
