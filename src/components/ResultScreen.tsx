'use client';

import Box from '@mui/material/Box';
import { type Dispatch, useMemo } from 'react';
import { buildMacros, buildPlan, buildProjection, type Metrics } from '@/lib/calc';
import type { Action, State } from '@/lib/state';
import { useTokens } from '@/theme/ThemeRegistry';
import GoalCard from './result/GoalCard';
import MacrosCard from './result/MacrosCard';
import PlanCard from './result/PlanCard';
import SummaryCard from './result/SummaryCard';
import TargetWeightCard from './result/TargetWeightCard';
import YourDataCard from './result/YourDataCard';

export default function ResultScreen({
  state,
  metrics,
  dispatch,
}: {
  state: State;
  metrics: Metrics;
  dispatch: Dispatch<Action>;
}) {
  const tokens = useTokens();

  const macros = useMemo(() => buildMacros(metrics, tokens.primary), [metrics, tokens.primary]);
  const projection = useMemo(
    () => buildProjection(metrics, state.goal, state.targetKey),
    [metrics, state.goal, state.targetKey],
  );
  const plan = useMemo(
    () => buildPlan(metrics, state.activity, state.goal),
    [metrics, state.activity, state.goal],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
        <Box
          sx={{
            flex: '1 1 320px',
            maxWidth: { xs: '100%', md: 420 },
            minWidth: 0,
            position: { xs: 'static', md: 'sticky' },
            top: 88,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <SummaryCard metrics={metrics} activity={state.activity} />
          <YourDataCard
            state={state}
            onEdit={() => dispatch({ type: 'editInputs' })}
            onReset={() => dispatch({ type: 'reset' })}
          />
        </Box>

        <Box
          sx={{ flex: '2 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <GoalCard metrics={metrics} />
          <TargetWeightCard
            metrics={metrics}
            projection={projection}
            onSelect={(key) => dispatch({ type: 'setTargetKey', value: key })}
          />
          <MacrosCard macros={macros} />
        </Box>
      </Box>

      <PlanCard plan={plan} goalLabel={metrics.goal.label} activity={state.activity} />
    </Box>
  );
}
