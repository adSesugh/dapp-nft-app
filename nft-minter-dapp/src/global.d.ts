// global.d.ts
interface RequestArguments {
  method: string;
  params?: unknown[] | Record<string, unknown>;
}

interface EthereumProvider {
  isMetaMask?: boolean;
  request(args: RequestArguments): Promise<unknown>;
  on(eventName: string, callback: (data: unknown) => void): void;
  removeListener(eventName: string, callback: (data: unknown) => void): void;
}

interface Window {
  ethereum?: EthereumProvider;
}
