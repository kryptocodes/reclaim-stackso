import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import QRCode from "react-qr-code";
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { Reclaim, Proof } from '@reclaimprotocol/js-sdk';
import { data } from 'autoprefixer';
import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi'
import { JsonViewer } from '@textea/json-viewer'
import { stack } from './_app';
import { toast, Toaster } from 'react-hot-toast';

const APP_ID = process.env.NEXT_PUBLIC_APP_ID!
const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET!


const providers = [
  { name: 'Github Total Repo', providerId: '5622b4ea-b953-4cd9-a377-409bb7ed5ec5' },
];



const Home: NextPage = () => {

  const [url, setUrl] = useState('')
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false)
  const { address, isConnected } = useAccount()
  const [showButton, setShowButton] = useState(true)

  const [myProviders, setMyProviders] = useState(providers)

  const [selectedProviderId, setSelectedProviderId] = useState('')

  const [proofs, setProofs] = useState<any>()

  const { width, height } = useWindowSize()

  const [showLeaderBoard, setShowLeaderBoard] = useState(false)

  const urlRef = useRef(null);


  const reclaimClient = new Reclaim.ProofRequest(APP_ID);

  

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      console.log('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const addPoints = async (address: string, points: number) => {
    try {
      const checkUser = await stack.getPoints(address)
      if(checkUser){
        await toast.error('User already submitted proof')
        return
      }
      stack.track('repos', {
        account: address,
        points: points,
        uniqueId: address,
      })
    } catch (error) {
      console.error('Error in addPoints', error)
    }
  }

  const getVerificationReq = async (providerId: string) => {
    try {
      setIsLoaded(true)
      const sessionData = await reclaimClient.buildProofRequest(providerId, true, 'V2Linking')
      reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET))
      reclaimClient.setRedirectUrl('https://reclaim-stackso.vercel.app')

      const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest()
      console.log('requestUrl', requestUrl)
      console.log('statusUrl', statusUrl)

      setUrl(requestUrl)
      setShowQR(true)
      setShowButton(false)
      setIsLoaded(false)

      await reclaimClient.startSession({
        onSuccessCallback: proofs => {
          console.log('Verification success', proofs)
          setShowLeaderBoard(false)
          // Your business logic here
          setProofs(proofs[0])
          const points = JSON.parse(proofs[0]?.claimData?.context)?.extractedParameters?.repositories ?? '0'
          addPoints(address!, parseInt(points ?? 0))
          setShowConfetti(true);
          setShowQR(false)
        },
        onFailureCallback: error => {
          console.error('Verification failed', error)
          // Your business logic here to handle the error
          console.log('error', error)
        }
      })
    } catch (error) {
      console.error('Error in getVerificationReq', error)
      // Handle error gracefully, e.g., show a notification to the user
      // and possibly revert UI changes made before the error occurred
    }
  }

  const handleButtonClick = (providerId: string) => {
    setIsCopied(false)
    setProofs(null)
    getVerificationReq(providerId)
  }


  useEffect(() => {
    if (!selectedProviderId && isConnected && address) {
      setSelectedProviderId(myProviders[0].providerId)
      setShowQR(false);
      setShowButton(false);
      handleButtonClick(myProviders[0].providerId)
    }
  }, [selectedProviderId, isConnected, address])

  useEffect(() => {
    let details = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;

    let isMobileDevice = regexp.test(details);

    if (isMobileDevice) {
      setIsMobileDevice(true)
    } else {
      setIsMobileDevice(false)
    }

  }, [])



  return (
    <div className={styles.container}>
      <Toaster 
        position='top-right'
        />
      <Head>
        <title>Get Rewarded based on Github Activity</title>
        <meta
          content="Prove your Github Total Repositories with Reclaim Protocol and Earn Points on Stack"
          name="description"
        />
        <link href="/logo.png" rel="icon" />
      </Head>


      <div
        style={{
          position: 'absolute',
          right: '0',
          top: '0',
          padding: '10px',
          zIndex: 1000,
          flexDirection: 'row',
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: '#fff',
          borderRadius: '0 0 0 10px',
        }}
      >


        <button
          style={{
            backgroundColor: '#0d76fc',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onMouseOver={(e: any) => {
            e.target.style.backgroundColor = '#0b5dc2';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e: any) => {
            e.target.style.backgroundColor = '#0d76fc';
            e.target.style.transform = 'scale(1)';
          }}
          onClick={() => setShowLeaderBoard(!showLeaderBoard)}
        >
          {showLeaderBoard ? 'Hide Leaderboard' : 'Show Leaderboard'}
        </button>
        {isConnected && (
          <ConnectButton label='Connect Wallet'
            chainStatus='none'
            accountStatus='address'
            showBalance={false}
          />)}
      </div>



      <main className={styles.main}>
        <h1 className={styles.title}>
        Get Rewarded based on Github Activity
        </h1>

        <p className={styles.description}>
          Prove your Github Total Repositories with Reclaim Protocol and Earn Points on Stack 🎉
        </p>

        {!showLeaderBoard && !isConnected && (
          <ConnectButton label='Connect Wallet to Get Started'
            chainStatus='none'
            accountStatus='address'
            showBalance={false}
          />
        )}

        {isLoaded && (<>
          <div role="status" className='mt-10'>
            <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>


          </div>
        </>)}
        {
          showLeaderBoard && (
            <iframe src="https://www.stack.so/leaderboard/leaderboard-40a3-78225-3129/embed?excludeHeader=true" width="100%" height="600px"
              allow="clipboard-write"></iframe>
          )
        }

        {!showLeaderBoard && showQR && isConnected && (
          <>
            {!isMobileDevice && (
              <>
                <input ref={urlRef} value={url} readOnly style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                {/* <button onClick={copyToClipboard} className="border-gray-500 border-2 px-2 hover:bg-gray-300 font-semibold rounded shadow">
                  {isCopied ? 'Copied!' : 'Copy Link'}</button> */}
                <div style={{ border: '16px solid white', marginTop: '20px' }}>
                  <QRCode value={url} />
                </div>

              </>
            )
            }
            {isMobileDevice && (
              <>
                <button
                  onClick={() => window.open(url, "_blank")}
                  style={{
                    backgroundColor: '#38a169', // Green shade
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'background-color 0.3s ease, transform 0.2s ease',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginTop: '1rem',
                  }}
                  onMouseOver={(e: any) => {
                    e.target.style.backgroundColor = '#2f855a'; // Darker green on hover
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseOut={(e: any) => {
                    e.target.style.backgroundColor = '#38a169';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  Generate Proof Link 🚀
                </button>
              </>
            )}

            <span
              style={{
                display: 'inline-block',
                color: '#A0AEC0', // Light gray color for the text
                marginTop: '1rem',
              }}
            >
              <button
                onClick={copyToClipboard}
                style={{
                  border: '2px solid #718096', // Gray border
                  padding: '0.5rem 1rem',
                  marginTop: '1rem',
                  borderRadius: '0.375rem',
                  fontWeight: '600',
                  color: isCopied ? '#38a169' : '#718096', // Change text color when copied
                  backgroundColor: isCopied ? '#e6fffa' : 'transparent', // Light green background when copied
                  transition: 'background-color 0.3s ease, color 0.3s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                }}
                onMouseOver={(e: any) => {
                  e.target.style.backgroundColor = '#E2E8F0'; // Light gray on hover
                  e.target.style.color = '#4A5568'; // Darker gray text on hover
                }}
                onMouseOut={(e: any) => {
                  e.target.style.backgroundColor = isCopied ? '#e6fffa' : 'transparent';
                  e.target.style.color = isCopied ? '#38a169' : '#718096';
                }}
              >
                {isCopied ? 'Copied!' : 'Copy Link'}
              </button>
            </span>

          </>
        )}
        {
          !showLeaderBoard && proofs && (
            <>
              <h3 className="text-slate-300 
              text-center mx-auto
              text-sm lg:text-2xl md:text-xl sm:text-lg xs:text-xs mt-8">Proof Received</h3>
              <p className="text-gray-300 text-center mx-auto text-sm lg:text-xl md:text-lg sm:text-lg xs:text-xs mt-4">
                Congratulations! you have earned {JSON.parse(proofs?.claimData?.context)?.extractedParameters?.repositories} points
              </p>
              {/* <p> {JSON.stringify(proofs?.claimData)}</p> */}
              <JsonViewer value={proofs?.claimData}
                rootName='proof'
              />



              {showConfetti && (
                <Confetti
                  width={width}
                  height={height}
                />
              )}
            </>
          )
        }



      </main>

    </div>
  );
};

export default Home;
