'use client';

import Box from '@mui/material/Box';
import { useMemo, useReducer } from 'react';
import { computeMetrics } from '@/lib/calc';
import { initialState, reducer } from '@/lib/state';
import AppHeader from './AppHeader';
import HomeScreen from './HomeScreen';
import InputScreen from './InputScreen';
import ResultScreen from './ResultScreen';

export default function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const metrics = useMemo(
    () =>
      computeMetrics({
        sexe: state.sexe,
        age: state.age,
        taille: state.taille,
        poids: state.poids,
        activity: state.activity,
        goal: state.goal,
      }),
    [state.sexe, state.age, state.taille, state.poids, state.activity, state.goal],
  );

  const showResult = state.screen === 'result' && metrics !== null;

  return (
    <Box
      sx={(t) => ({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: t.tokens.bg,
        color: t.tokens.text,
      })}
    >
      <AppHeader onReset={() => dispatch({ type: 'reset' })} />

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 1200,
          mx: 'auto',
          px: 3,
          pt: 4,
          pb: 8,
        }}
      >
        {state.screen === 'home' ? (
          <HomeScreen
            onStartWizard={() => dispatch({ type: 'startWizard' })}
            onStartForm={() => dispatch({ type: 'startForm' })}
          />
        ) : null}

        {state.screen === 'input' ? (
          <InputScreen state={state} metrics={metrics} dispatch={dispatch} />
        ) : null}

        {showResult ? <ResultScreen state={state} metrics={metrics} dispatch={dispatch} /> : null}
      </Box>
    </Box>
  );
}
