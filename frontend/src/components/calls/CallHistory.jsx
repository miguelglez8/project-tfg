import { useState } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Typography,
  Button,
  TextField,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  List,
} from "@mui/material";
import CallsItem from "./CallsItem";
import { Search } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const CallHistory = ({ callHistory }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredCallHistory = callHistory.filter((item) => {
    if (filter === "all") return true;
    if (filter === "missed") return item.type === "MISS";
    if (filter === "cancelled") return item.type === "CANCEL";
    return item.type === "INCOMING" || item.type === "OUTGOING";
  });

  const searchedCallHistory = filteredCallHistory.filter((item) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    return fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Paper
      elevation={3}
      style={{ margin: "auto", maxHeight: "70vh", overflowY: "auto", padding: "5px" }}
    >
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography
            variant="h5"
            style={{ textAlign: "center", marginTop: "10px" }}
            gutterBottom
          >
            {t("calls.callHistoryTitle")}
          </Typography>
        </Grid>
        <Grid
          item
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          <Grid item>
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => handleFilterChange("all")}
            >
              {t("calls.all")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={filter === "missed" ? "contained" : "outlined"}
              onClick={() => handleFilterChange("missed")}
            >
              {t("calls.missed")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={filter === "cancelled" ? "contained" : "outlined"}
              onClick={() => handleFilterChange("cancelled")}
            >
              {t("calls.cancelled")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant={filter === "answered" ? "contained" : "outlined"}
              onClick={() => handleFilterChange("answered")}
            >
              {t("calls.answered")}
            </Button>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              placeholder={t("calls.search")}
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: <Search />,
              }}
            />
          </Grid>
        </Grid>
        <Grid
          item
          style={{ overflowY: "auto", maxHeight: "70vh", marginTop: "8px" }}
        >
          <List>
            {searchedCallHistory.length > 0 ? (
              searchedCallHistory.map((call, idx) => (
                <div key={idx}>
                  <CallsItem call={call} />
                  {idx !== searchedCallHistory.length - 1 && <Divider />}
                </div>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      color="textSecondary"
                      align="center"
                    >
                      {t("calls.noCallsFound")}
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Grid>
      </Grid>
    </Paper>
  );
};

CallHistory.propTypes = {
  callHistory: PropTypes.array.isRequired,
};

export default CallHistory;
