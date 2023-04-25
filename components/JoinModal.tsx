import { FC, useEffect, useState } from "react";
import { Dialog, Disclosure, Transition} from '@headlessui/react'
import ArtistsApp from "./ArtistsApp";
import Dialect from "./Dialect";
import clsx from "clsx";

interface JoinModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
const JoinModal: FC<JoinModalProps> = ({ isOpen, setIsOpen }) => {
  const [slideIn, setSlideIn] = useState(false)

  const close = () => {
    setSlideIn(false)
    setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  useEffect(() => {
    if (isOpen) {
      setSlideIn(true)
    }
  }, [isOpen])

  return (
    <Dialog
      open={isOpen}
      onClose={close}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-stone-950/80" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Transition
          // appear
          show={slideIn}
          enter="duration-200 ease-out"
          enterFrom="-translate-y-1/2 scale-95 opacity-0"
          enterTo="translate-y-0 scale-100 opacity-100"
          leave="duration-200 ease-out"
          leaveFrom="translate-y-0 scale-100 opacity-100"
          leaveTo="-translate-y-1/2 scale-95 opacity-0"
        >
          <Dialog.Panel className="bg-stone-900 p-10 rounded-lg relative">
            <Dialog.Title className="text-3xl text-center">Join Curate</Dialog.Title>
            <Dialog.Description className="my-4 text-center">
              Sign up to join the Curate community and get early access!
            </Dialog.Description>

            <button className="absolute right-3 top-3" onClick={close}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="w-6 h-6 fill-amber-50">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

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
                      <div className="max-w-lg text-center">
                        <p>Consider applying to participate in our upcoming art drop. </p>
                        <p className="italic mb-5">Selected artists will get paid a minimum of $500 USD as well as a lifetime professional subscription to Curate</p>
                        <ArtistsApp />
                      </div>

                    </Disclosure.Panel>
                  </Transition>
                </>
              )}
            </Disclosure>
          </Dialog.Panel>
        </Transition>
      </div>
    </Dialog>
  )
}

export default JoinModal