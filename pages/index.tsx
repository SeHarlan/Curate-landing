import ArtistsApp from '@/components/ArtistsApp';
import Dialect from '@/components/Dialect';
import JoinModal from '@/components/JoinModal';
import DiscordLogo from '@/components/svg/discord';
import TwitterLogo from '@/components/svg/twitter';
import useWindowSize from '@/hooks/useWindowSize';
import { Disclosure, Transition } from '@headlessui/react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

const MaurerBG = dynamic(() => import('../components/MaurerBG'), { ssr: false });

export default function Home() {
  const { isMdScreen } = useWindowSize();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [textIndex, setTextIndex] = useState(-7);
  const text = "Curate"

  const [hasScrolled, setHasScrolled] = useState(false);

  const twitterLink = "https://twitter.com/ev3reth"
  const discordLink = "https://twitter.com/ev3reth"
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textIndex < text.length) {
        if(textIndex >= 0) setTitle(title + text[textIndex]); // Add the next character to the title
        setTextIndex(textIndex + 1); // Increment the index
      }
    }, 350); //delay


    return () => {
      clearTimeout(timer);
    }
  }, [textIndex]);

  useEffect(() => { 
    // listen to see if the user has scrolled
    const onScroll = () => {
      if (window.scrollY > 0) setHasScrolled(true);
    } 
    window.addEventListener("scroll", onScroll);
    //take care of cleanup
    return () => window.removeEventListener("scroll", onScroll);
  },[])

  return (
    <div className='bg-stone-950 text-amber-50 w-full overflow-x-hidden'>
      <JoinModal isOpen={modalOpen}  setIsOpen={setModalOpen}/>
      <div
        className={clsx(
          'fixed w-full top-0 left-0 z-30 hover:opacity-100 duration-200',
          isMdScreen ? "opacity-100" : "opacity-50"
        )}
      >
        <Wait time="delay-[4s] duration-[3s]">
          <div className='
            flex justify-evenly items-center p-4 max-w-lg mx-auto
          bg-stone-900 rounded-b-xl shadow-xl
          '>
            <a href={twitterLink} target="_blank"><TwitterLogo fillClass='fill-rose-800' /></a>
            <button
              onClick={() => setModalOpen(true)}
              className="border-2 border-rose-800 px-4 rounded duration-100 hover:bg-rose-800/30 active:bg-transparent text-amber-50"
            >Join Curate</button>
            <a href={discordLink} target="_blank"><DiscordLogo fillClass='fill-rose-800' /></a>
          </div>
        </Wait>
      </div>
      <div className='h-screen flex flex-col justify-evenly relative'>
        <MaurerBG className='absolute top-0 left-0 w-full h-full' />
        <div className='flex items-center justify-center'>
          <div className='relative md:left-[1rem] flex flex-col justify-start items-start'>
            <Wait time="delay-[0.5s]">
              <p
                className='font-title text-left text-[4rem] md:text-[8rem] lg:text-[10rem] text-stone-800 relative lg:right-[10vw] top-[4rem]'
                style={{ textShadow: '4px 4px 0px rgba(48, 45, 43, 0.5)'}}
              >Create</p>
            </Wait>
            <h1
              className='font-title text-left h-[10rem] text-[4rem] md:text-[7rem] lg:text-[10rem] leading-none z-10 flex items-center justify-center'
              style={{ textShadow: '4px 4px 0px rgba(87 83 78)', filter: 'drop-shadow(2px 2px 6px black' }}
            >{title}</h1>
            <Wait time="delay-[1.5s]">
              <p
                className='font-title text-left text-[4rem] md:text-[8rem] lg:text-[10rem] text-stone-800 relative lg:left-[10vw] bottom-[4rem] z-[-1]'
                style={{ textShadow: '4px 4px 0px rgba(48, 45, 43, 0.5)' }}
              >Collect</p>
            </Wait>
          </div>       

        </div>
        <div
          className='
            grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] 
            px-20 gap-3 items-center relative 
            text-2xl text-center
          '
          style={{ textShadow: '2px 2px 4px black' }}
        >
          <Slide time="delay-[3s]">Create</Slide>

          <Slide time="delay-[2.75s]">|</Slide>

          <Slide time="delay-[2.5s]">Everything In Between</Slide>

          <Slide time="delay-[2.75s]">|</Slide>

          <Slide time="delay-[3s]">Collect</Slide>
        </div>
        <div
          className={clsx(
            'flex justify-center absolute bottom-[0.5rem] w-full transition duration-1000',
            hasScrolled ? 'opacity-0' : 'opacity-100'
          )}
        >
          <Wait time="delay-[5s] duration-[3s]">
            <svg className='w-10 h-10 animate-bounce' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v9.586l3.293-3.293a.999.999 0 111.414 1.414l-5 5a.999.999 0 01-1.414 0l-5-5a.999.999 0 111.414-1.414L9 13.586V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Wait>
        </div>
      </div>

      <div className='m-auto max-w-screen-2xl p-5 mt-10'>
        <div className='grid grid-cols-1 md:grid-cols-2 items-center gap-5 md:text-lg'>
          <div className='mb-3 md:col-span-2 flex justify-center'>
            <h2 className="text-3xl md:text-5xl border-b-4 border-rose-800 py-2 md:px-6 text-center">A New Art Discovery Experience</h2>
          </div>
          <p className='md:col-span-2 text-center italic md:text-2xl'>
            You focus on creating or collecting, we take care of everything in between.
          </p>
          <div>
            <p><span className='text-rose-700 font-bold'>Artists</span> can build a trusted reputation and distinguish themselves based on their art, not their social media skills.</p>
            <br/>
            <p>Curate will eliminate the need for artists to create their own websites or become social media experts. Curate's homepage galleries and feeds will have all the customization and utility they would need to stand out and run a successful business.</p>
          </div>

          <div className='justify-self-center'>
            <Image src="/images/ME1.png" alt="" width="300" height="300"/>
          </div>
          <div className='justify-self-center hidden md:block'>
            <Image src="/images/ME2.png" alt="" width="300" height="300" />
          </div>
     
          <div>
            <p><span className='text-rose-700 font-bold'>Collectors</span> can easily find and foster relationships with talented new artists as well as stay up to date with the artists they already love.</p>
            <br />
            <p>Curate plans to become THE place for art discovery. Regardless of chain or marketplace preference, collectors will visit Curate to find digital art they want.</p>
          </div>
        </div>
        <div className='mt-12 md:mt-0 mb-8 flex justify-center'>
          <h2 className="text-3xl md:text-5xl border-b-4 border-rose-800 py-2 md:px-6 text-center">
            Join Curate
          </h2>
        </div>
        <p className='mb-10 text-center md:text-2xl italic'>
          Sign up to join the Curate community and get early access!
        </p>
        <div className="flex justify-center mb-10">
          <Dialect />
        </div>
        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="py-2 w-full text-center flex justify-center items-center gap-2 text-lg">
                Are you an artist?
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"
                  className={clsx("w-6 h-6 duration-200 stroke-rose-700", open ? "rotate-180" : "rotate-0")}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </Disclosure.Button>
              <Transition
                enter="transition duration-100 ease-out"
                enterFrom="transform -translate-y-5 opacity-0"
                enterTo="transform translate-y-0 opacity-100"
                leave="transition duration-75 ease-out"
                leaveFrom="transform translate-y-0  opacity-100"
                leaveTo="transform -translate-y-5 opacity-0"
              >
                <Disclosure.Panel>
                  <div className="text-center">
                    <p>Consider applying to participate in our upcoming art drop. </p>
                    <p className="italic mb-5">Selected artists will get paid a minimum of $500 USD as well as a lifetime professional subscription to Curate</p>
                    <ArtistsApp />
                  </div>

                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
        <Image src="/images/ME3.png" alt="" width="300" height="300" className='mx-auto'/>
      </div>
    </div>
  )
}

const Wait: FC<{ children: JSX.Element | string, time: string }> = ({ children, time }) => (
  <Transition
    appear={true}
    show={true}
    enter={`${time} transition`}
    enterFrom="transform opacity-0"
    enterTo="transform opacity-100"
  >
    {children}
  </Transition>
)

const Slide: FC<{ children: JSX.Element | string, time: string }> = ({ children, time }) => (
  <Transition
    appear={true}
    show={true}
    enter={`${time} duration-1000 transition ease-out`}
    enterFrom="transform translate-y-10 opacity-0"
    enterTo="transform translate-y-0 opacity-100"
  >
    {children}
  </Transition>
)