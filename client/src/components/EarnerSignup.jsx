import SignupForm from "./SignupForm";

export default function EarnerSignup() {
  return (
    // <SignupForm
    //   title="Earner Signup"
    //   buttonText="Create Account"
    //   buttonClass="bg-green-600 hover:bg-green-700"
    //   showSocials
      
    // />


    <SignupForm
  title="Earner Signup"
  buttonText="Create Earner Account"
  buttonClass="bg-green-600 hover:bg-green-700"
  showSocials={false}
  role="earner"
/>
  );
}