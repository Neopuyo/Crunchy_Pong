import ErrorHandler from '@/components/error/ErrorHandler';
 
export default function NotFound() {
  return (
    <ErrorHandler errorTitle={"Oops... this page does not exist!"} errorNotif={" "} />
  )
}
