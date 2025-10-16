"use client";

import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import {
  useConnection as useSolanaConnection,
  useWallet as useSolanaWallet,
} from '@solana/wallet-adapter-react';
import {
  PublicKey as SolanaPublicKey,
  SystemProgram as SolanaSystemProgram,
  Transaction as SolanaTransaction,
} from "@solana/web3.js";
import { useEffect, useCallback, useState, useMemo, type ChangeEvent } from "react";
import { Input } from "../components/ui/input";
import sdk, {
  AddMiniApp,
  MiniAppNotificationDetails,
  type Context,
} from "@farcaster/miniapp-sdk";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { Label } from "~/components/ui/label";

// Handles JSON stringify with `BigInt` values
function safeJsonStringify(obj: unknown) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
}

export default function Demo(
  { title }: { title?: string } = { title: "Solana Starter - Farcaster Mini App" }
) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.MiniAppContext>();
  const [isContextOpen, setIsContextOpen] = useState(false);

  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] =
    useState<MiniAppNotificationDetails | null>(null);

  const [lastEvent, setLastEvent] = useState("");
  const [addFrameResult, setAddFrameResult] = useState("");
  const [sendNotificationResult, setSendNotificationResult] = useState("");

  useEffect(() => {
    setNotificationDetails(context?.client.notificationDetails ?? null);
  }, [context]);

  const { publicKey: solanaPublicKey } = useSolanaWallet();
  const solanaAddress = solanaPublicKey?.toBase58();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      setAdded(context.client.added);

      sdk.on("miniAppAdded", ({ notificationDetails }) => {
        setLastEvent(
          `miniAppAdded${!!notificationDetails ? ", notifications enabled" : ""}`
        );
        setAdded(true);
        if (notificationDetails) {
          setNotificationDetails(notificationDetails);
        }
      });

      sdk.on("miniAppAddRejected", ({ reason }) => {
        setLastEvent(`miniAppAddRejected, reason ${reason}`);
      });

      sdk.on("miniAppRemoved", () => {
        setLastEvent("miniAppRemoved");
        setAdded(false);
        setNotificationDetails(null);
      });

      sdk.on("notificationsEnabled", ({ notificationDetails }) => {
        setLastEvent("notificationsEnabled");
        setNotificationDetails(notificationDetails);
      });
      
      sdk.on("notificationsDisabled", () => {
        setLastEvent("notificationsDisabled");
        setNotificationDetails(null);
      });

      sdk.actions.ready({});
    };
    
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl("https://x.com/PlayTownSquare");
  }, []);

  const composeCast = useCallback(() => {
    sdk.actions.composeCast({
      text: "Check out this amazing Solana Mini App by TownSquare! 🚀",
    });
  }, []);

  const signIn = useCallback(() => {
    sdk.actions.signIn();
  }, []);

  const viewProfile = useCallback(() => {
    sdk.actions.openUrl("https://farcaster.xyz/~/profiles/1374072");
  }, []);

  const close = useCallback(() => {
    sdk.actions.close();
  }, []);

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);
      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added! Got notification token: ${result.notificationDetails.token}`
          : "Added! No notification details"
      );
    } catch (error) {
      if (error instanceof AddMiniApp.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      } else if (error instanceof AddMiniApp.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      } else {
        setAddFrameResult(`Error: ${error}`);
      }
    }
  }, []);

  const sendNotification = useCallback(async () => {
    setSendNotificationResult("");
    if (!notificationDetails || !context) {
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: context.user.fid,
          notificationDetails,
        }),
      });

      if (response.status === 200) {
        setSendNotificationResult("Notification sent successfully!");
        return;
      } else if (response.status === 429) {
        setSendNotificationResult("Rate limited - try again later");
        return;
      }

      const data = await response.text();
      setSendNotificationResult(`Error: ${data}`);
    } catch (error) {
      setSendNotificationResult(`Error: ${error}`);
    }
  }, [context, notificationDetails]);

  const toggleContext = useCallback(() => {
    setIsContextOpen((prev) => !prev);
  }, []);

  if (!isSDKLoaded) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-4 px-2">
      <h1 className="text-2xl font-bold mb-2 text-center">{title}</h1>
      <p className="text-sm text-gray-600 mb-4 text-center">Solana Mini App Template by TownSquare</p>

      <div className="space-y-4">
        {/* User Profile Section */}
        {context && (
          <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50">
            <h2 className="text-lg font-semibold mb-3 text-black">User Profile</h2>
            <div className="flex items-center space-x-3">
              {context.user.pfpUrl && (
                <img 
                  src={context.user.pfpUrl} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm" 
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{context.user.displayName}</div>
                <div className="text-sm text-gray-600">@{context.user.username}</div>
                <div className="text-xs text-gray-500">FID: {context.user.fid}</div>
              </div>
            </div>
          </div>
        )}

        {/* Farcaster Mini App Controls */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Farcaster Controls</h2>
          
          <div className="space-y-2">
            <Button onClick={addFrame} className="w-full">
              Add Frame
            </Button>
            
            <Button onClick={close} className="w-full">
              Close App
            </Button>
            
            <Button onClick={composeCast} className="w-full">
              Compose Cast
            </Button>
            
            <Button onClick={openUrl} className="w-full">
              Visit TownSquare
            </Button>
            
            <Button onClick={signIn} className="w-full">
              Sign In
            </Button>
            
            <Button onClick={viewProfile} className="w-full">
              View TownSquare Profile
            </Button>
            {addFrameResult && (
              <div className="text-xs mt-1 text-gray-600 bg-gray-100 p-2 rounded">
                {addFrameResult}
              </div>
            )}
          </div>

          {notificationDetails && (
            <div className="mt-3">
              <Button onClick={sendNotification} className="w-full">
                Send Test Notification
              </Button>
              {sendNotificationResult && (
                <div className="text-xs mt-1 text-gray-600 bg-gray-100 p-2 rounded">
                  {sendNotificationResult}
                </div>
              )}
            </div>
          )}
        </div>

        {/* App Status */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">App Status</h2>
          <div className="text-sm space-y-1">
            <div>Added to Farcaster: <span className="font-semibold">{added ? "Yes" : "No"}</span></div>
            <div>Last Event: <span className="font-semibold">{lastEvent || "None"}</span></div>
            {solanaAddress && (
              <div>Solana Wallet: <span className="font-mono text-xs">{truncateAddress(solanaAddress)}</span></div>
            )}
          </div>
        </div>

        {/* Solana Features */}
        {solanaAddress && (
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Solana Features</h2>
            <div className="space-y-3">
              <SignSolanaMessage />
              <SendSolana />
              <SendTokenSolana />
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Debug Information</h2>
          
          <div className="space-y-2">
            <Button onClick={toggleContext} className="w-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              {isContextOpen ? "Hide" : "Show"} Full Context
            </Button>
            
            {context && (
              <>
                <Button 
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(context.user, null, 2))}
                  className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Copy User Data
                </Button>
                
                <Button 
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(context.client, null, 2))}
                  className="w-full bg-green-100 text-green-700 hover:bg-green-200"
                >
                  Copy Client Data
                </Button>
                
                <Button 
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(context.features, null, 2))}
                  className="w-full bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  Copy Features Data
                </Button>
              </>
            )}
          </div>

          {/* User Information Display */}
          {context && (
            <div className="mt-4 space-y-3">
              <div className="border-l-4 border-blue-500 pl-3">
                <h3 className="font-semibold text-blue-700">User Information</h3>
                <div className="text-sm space-y-1 mt-1">
                  <div><span className="font-medium">FID:</span> {context.user.fid}</div>
                  <div><span className="font-medium">Username:</span> {context.user.username}</div>
                  <div><span className="font-medium">Display Name:</span> {context.user.displayName}</div>
                  {context.user.pfpUrl && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Profile Picture:</span>
                      <img src={context.user.pfpUrl} alt="Profile" className="w-8 h-8 rounded-full" />
                    </div>
                  )}
                  {context.user.location && (
                    <div>
                      <span className="font-medium">Location:</span> {context.user.location.description || "Not specified"}
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information Display */}
              <div className="border-l-4 border-green-500 pl-3">
                <h3 className="font-semibold text-green-700">Client Information</h3>
                <div className="text-sm space-y-1 mt-1">
                  <div><span className="font-medium">Platform:</span> {context.client.platformType}</div>
                  <div><span className="font-medium">Client FID:</span> {context.client.clientFid}</div>
                  <div><span className="font-medium">Added:</span> <span className={context.client.added ? "text-green-600" : "text-red-600"}>{context.client.added ? "Yes" : "No"}</span></div>
                </div>
              </div>

              {/* Features Information Display */}
              <div className="border-l-4 border-purple-500 pl-3">
                <h3 className="font-semibold text-purple-700">Features</h3>
                <div className="text-sm space-y-1 mt-1">
                  <div><span className="font-medium">Haptics:</span> <span className={context.features.haptics ? "text-green-600" : "text-red-600"}>{context.features.haptics ? "Enabled" : "Disabled"}</span></div>
                  <div><span className="font-medium">Camera & Mic:</span> <span className={context.features.cameraAndMicrophoneAccess ? "text-green-600" : "text-red-600"}>{context.features.cameraAndMicrophoneAccess ? "Enabled" : "Disabled"}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Full Context Display */}
          {isContextOpen && context && (
            <div className="text-xs mt-3 text-gray-600 bg-gray-100 p-2 rounded max-h-32 overflow-auto">
              <pre className="whitespace-pre-wrap">
                {safeJsonStringify(context)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SignSolanaMessage() {
  const [signature, setSignature] = useState<string | undefined>();
  const [signError, setSignError] = useState<Error | undefined>();
  const [signPending, setSignPending] = useState(false);

  const { signMessage } = useSolanaWallet();
  
  const handleSignMessage = useCallback(async () => {
    setSignPending(true);
    try {
      if (!signMessage) {
        throw new Error('Wallet does not support message signing');
      }
      const input = Buffer.from("Hello from Solana Starter!", "utf8");
      const signatureBytes = await signMessage(input);
      setSignature(Buffer.from(signatureBytes).toString('base64'));
      setSignError(undefined);
    } catch (error) {
      setSignError(error as Error);
    } finally {
      setSignPending(false);
    }
  }, [signMessage]);

  return (
    <div className="space-y-2">
      <Button onClick={handleSignMessage} disabled={signPending} className="w-full">
        {signPending ? "Signing..." : "Sign Message"}
      </Button>
      {signature && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          ✅ Message signed successfully!
        </div>
      )}
      {signError && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ❌ Error: {signError.message}
        </div>
      )}
    </div>
  );
}

// Demo wallet address for testing
const DEMO_WALLET_ADDRESS = '5onjZQHpbNJytKMUs5L6JPzW6WgRs14P94DzzenjqmKs';

function SendSolana() {
  const [state, setState] = useState<
    | { status: 'none' }
    | { status: 'pending' }
    | { status: 'error'; error: string }
    | { status: 'success'; signature: string }
  >({ status: 'none' });

  const { connection: solanaConnection } = useSolanaConnection();
  const { sendTransaction, publicKey } = useSolanaWallet();

  const handleSend = useCallback(async () => {
    setState({ status: 'pending' });
    try {
      if (!publicKey) {
        throw new Error('Please connect your Solana wallet');
      }

      const { blockhash } = await solanaConnection.getLatestBlockhash();
      if (!blockhash) {
        throw new Error('Failed to fetch latest blockhash');
      }

      const transaction = new SolanaTransaction();
      transaction.add(
        SolanaSystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new SolanaPublicKey(DEMO_WALLET_ADDRESS),
          lamports: 1000n, // Send 1000 lamports (0.000001 SOL)
        }),
      );
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, solanaConnection);
      setState({ status: 'success', signature });
    } catch (error) {
      setState({ status: 'error', error: (error as Error).message });
    }
  }, [publicKey, solanaConnection, sendTransaction]);

  return (
    <div className="space-y-2">
      <Button onClick={handleSend} disabled={state.status === 'pending'} className="w-full">
        {state.status === 'pending' ? 'Sending...' : 'Send 0.000001 SOL'}
      </Button>
      {state.status === 'error' && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ❌ Error: {state.error}
        </div>
      )}
      {state.status === 'success' && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          ✅ Success! 
          <a 
            href={`https://explorer.solana.com/tx/${state.signature}?cluster=devnet`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline ml-1"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
}

function SendTokenSolana() {
  const [state, setState] = useState<
    | { status: 'none' }
    | { status: 'pending' }
    | { status: 'success'; signature: string }
    | { status: 'error'; error: string }
  >({ status: 'none' });

  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [associatedMapping, setAssociatedMapping] = useState<{ token: string, decimals: number } | undefined>(undefined);
  const [destinationAddress, setDestinationAddress] = useState(DEMO_WALLET_ADDRESS);

  const { publicKey, sendTransaction } = useSolanaWallet();
  const { connection: solanaConnection } = useSolanaConnection();

  // Popular Solana tokens
  const tokenMints = useMemo(() => ({
    'USDC': { token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
    'USDT': { token: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6 },
    'BONK': { token: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5 },
  }), []);

  const handleSymbolChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const symbol = e.target.value;
    setSelectedSymbol(symbol);
    if (symbol && tokenMints[symbol as keyof typeof tokenMints]) {
      setAssociatedMapping(tokenMints[symbol as keyof typeof tokenMints]);
    } else {
      setAssociatedMapping(undefined);
    }
  }, [tokenMints]);

  const handleSend = useCallback(async () => {
    if (!publicKey) {
      throw new Error('Please connect your Solana wallet');
    }

    if (!selectedSymbol || !associatedMapping) {
      throw new Error('Please select a token');
    }

    setState({ status: 'pending' });
    try {
      const { blockhash } = await solanaConnection.getLatestBlockhash();
      if (!blockhash) {
        throw new Error('Failed to fetch the latest blockhash');
      }

      const transaction = new SolanaTransaction();
      const tokenMintPublicKey = new SolanaPublicKey(associatedMapping.token);
      const recipientPublicKey = new SolanaPublicKey(destinationAddress);

      // Send 0.01 tokens
      const amount = 0.01 * Math.pow(10, associatedMapping.decimals);

      // Get token accounts
      const fromAta = await getAssociatedTokenAddress(tokenMintPublicKey, publicKey);
      const toAta = await getAssociatedTokenAddress(tokenMintPublicKey, recipientPublicKey);

      // Check if recipient's ATA exists, create if not
      const toAtaAccountInfo = await solanaConnection.getAccountInfo(toAta);
      if (!toAtaAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            toAta, // ata
            recipientPublicKey, // owner
            tokenMintPublicKey // mint
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferCheckedInstruction(
          fromAta, // source
          tokenMintPublicKey, // mint
          toAta, // destination
          publicKey, // owner
          amount, // amount
          associatedMapping.decimals // decimals
        )
      );

      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, solanaConnection);
      setState({ status: 'success', signature });
    } catch (error) {
      setState({ status: 'error', error: (error as Error).message });
    }
  }, [
    publicKey,
    selectedSymbol,
    associatedMapping,
    destinationAddress,
    solanaConnection,
  ]);

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="token-select" className="text-sm font-medium">
          Select Token:
        </Label>
        <select
          id="token-select"
          value={selectedSymbol}
          onChange={handleSymbolChange}
          className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800 text-sm"
        >
          <option value="">Select a token</option>
          {Object.keys(tokenMints).map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="destination-address" className="text-sm font-medium">
          Destination Address:
        </Label>
        <Input
          id="destination-address"
          type="text"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
          placeholder="Enter Solana address"
          className="w-full text-sm"
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={state.status === 'pending' || !selectedSymbol || !destinationAddress}
        className="w-full"
      >
        {state.status === 'pending' ? 'Sending...' : `Send 0.01 ${selectedSymbol || 'Token'}`}
      </Button>

      {state.status === 'error' && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ❌ Error: {state.error}
        </div>
      )}

      {state.status === 'success' && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          ✅ Token sent successfully! 
          <a 
            href={`https://explorer.solana.com/tx/${state.signature}?cluster=devnet`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline ml-1"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  );
}