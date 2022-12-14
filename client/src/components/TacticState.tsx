import * as React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ReactMarkdown from 'react-markdown';
import { MathJax } from "better-react-mathjax";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { Paper, Box, Typography, Alert, FormControlLabel, FormGroup, Switch, Collapse } from '@mui/material';

// TODO: Dead variables (x✝) are not displayed correctly.

function Goal({ goal }) {

  const [showHints, setShowHints] = React.useState(false);

  const handleHintsChange = () => {
    setShowHints((prev) => !prev);
  };

  const hasObject = typeof goal.objects === "object" && goal.objects.length > 0
  const hasAssumption = typeof goal.assumptions === "object" && goal.assumptions.length > 0
  const openMessages = typeof goal.messages === "object" ? goal.messages.filter((msg) => ! msg.spoiler) : []
  const hints = typeof goal.messages === "object" ? goal.messages.filter((msg) => msg.spoiler) : []
  const hasHints = hints.length > 0
  return (
    <Box sx={{ pl: 2 }}>
      {hasObject && <Box><Typography>Objects</Typography>
        <List>
          {goal.objects.map((item) =>
            <ListItem key={item.userName}>
              <Typography color="primary" sx={{ mr: 1 }}>{item.userName}</Typography> :
              <Typography color="secondary" sx={{ ml: 1 }}>{item.type}</Typography>
            </ListItem>)}
        </List></Box>}
      {hasAssumption && <Box><Typography>Assumptions</Typography>
        <List>
          {goal.assumptions.map((item) => <ListItem key={item}><Typography color="primary" sx={{ mr: 1 }}>{item.userName}</Typography> :
            <Typography color="secondary" sx={{ ml: 1 }}>{item.type}</Typography></ListItem>)}
        </List></Box>}
      <Typography>Prove:</Typography>
      <Typography color="primary" sx={{ ml: 2 }}>{goal.goal}</Typography>
      {openMessages.map((message) => <Alert severity="info" sx={{ mt: 1 }}><MathJax><ReactMarkdown>{message.message}</ReactMarkdown></MathJax></Alert>)}
      {hasHints &&
        <FormControlLabel
          control={<Switch checked={showHints} onChange={handleHintsChange} />}
          label="Help"
        />}
        {hints.map((hint) => <Collapse in={showHints}><Alert severity="warning" sx={{ mt: 1 }}><MathJax><ReactMarkdown>{hint.message}</ReactMarkdown></MathJax></Alert></Collapse>)}
    </Box>)
}

function TacticState({ goals, errors, completed }) {
  const hasError = typeof errors === "object" && errors.length > 0
  const hasGoal = goals !== null && goals.length > 0
  const hasManyGoal = hasGoal && goals.length > 1
  return (
    <Box sx={{ height: "100%" }}>
      {goals === null && <Typography variant="h6">No goals at cursor position</Typography>}
      {hasGoal && <Paper sx={{ pt: 1, pl: 2, pr: 3, pb: 1, height: "100%" }}><Typography variant="h5">Main goal at cursor</Typography> <Goal goal={goals[0]} /></Paper>}
      {completed && <Typography variant="h6">Level completed ! 🎉</Typography>}
      {hasError && <Paper sx={{ pt: 1, pl: 2, pr: 3, pb: 1, height: "100%" }}>
        {errors.map(({severity, message}) => <Typography color={{1: "red", 2:"orange", 3:"blue", 4:"gray"}[severity]}>{message}</Typography>)}
        </Paper>}
      {hasManyGoal && <Paper sx={{ pt: 1, pl: 2, pr: 3, pb: 1, mt: 1 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Other goals</Typography>
        {goals.slice(1).map((goal, index) => <Paper><Goal key={index} goal={goal} /></Paper>)}
      </Paper>}
    </Box>
  )
}

export default TacticState
