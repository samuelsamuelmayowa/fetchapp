import SignupForm from "./SignupForm";

export default function CreatorSignup() {
  return (
    // <SignupForm
    //   title="Creator Signup"
    //   buttonText="Create Account"
    //   buttonClass="bg-blue-600 hover:bg-blue-700"
      
    // />
  


<SignupForm
  title="Creator Signup"
  buttonText="Create Creator Account"
  buttonClass="bg-blue-600 hover:bg-blue-700"
  showSocials={true}
  role="creator"
/>
  );
}