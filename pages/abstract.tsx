import WriteOn from '@/components/WriteOn';
import { isWebGLSupported } from '@/utils';
import { Transition } from '@headlessui/react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const MainBG = dynamic(() => import('../components/MainBG'), { ssr: false });

export default function Home() {
  const [title, setTitle] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const text = "Curate"

  useEffect(() => {
    const timer = setTimeout(() => {
      if (textIndex < text.length) {
        if (textIndex >= 0) setTitle(title + text[textIndex]); // Add the next character to the title
      }
      setTextIndex(textIndex + 1); // Increment the index
    }, 300); //delay

    return () => {
      clearTimeout(timer);
    }
  }, [textIndex]);
  
  return (
    <div className="flex flex-col justify-center items-center h-screen relative bg-stone-100 text-stone-800">
      <MainBG className='absolute top-0 left-0 w-full h-full' />

      <Transition
        appear={true}
        show={true}
        enter="transition duration-[0.5s] ease-out"
        enterFrom="transform translate-y-5 opacity-0"
        enterTo="transform translate-y-0 opacity-100"
      >
      <h1 className='font-title text-7xl lg:text-9xl text-center text-stone-80 '
        style={{ textShadow: '3px 3px 0px rgba(97 93 88)' }}
      >{title}</h1>
      </Transition>
 

     
        

        <Transition
          appear={true}
          show={true}
          enter="delay-[2s] transition duration-[2.5s] ease-out"
          enterFrom="transform translate-y-5 opacity-0"
          enterTo="transform translate-y-0 opacity-100"
        >
        <p className='text-2xl mt-10' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>A New Art Discovery Experience</p>
        </Transition>
    </div>
  )
}
