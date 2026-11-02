import { runSimulation } from '../simulation/simulator';
import { SimulationConfig, SimulationWorkerMessage } from '../models/poker.models';

interface SimulationRequest {
  readonly type: 'run';
  readonly requestId: number;
  readonly config: SimulationConfig;
}

addEventListener('message', ({ data }: MessageEvent<SimulationRequest>) => {
  if (data?.type !== 'run') return;
  try {
    const result = runSimulation(data.config, completed => {
      const progress: SimulationWorkerMessage = {
        type: 'progress',
        requestId: data.requestId,
        completed,
        total: data.config.iterations,
      };
      postMessage(progress);
    });
    postMessage({ type: 'result', requestId: data.requestId, result } satisfies SimulationWorkerMessage);
  } catch (error) {
    postMessage({
      type: 'error',
      requestId: data.requestId,
      message: error instanceof Error ? error.message : 'Não foi possível concluir a simulação.',
    } satisfies SimulationWorkerMessage);
  }
});
