import EmailInterface from "../components/email-interface"

export default function Home() {
  return (
    <main 
      className="min-h-screen p-8 bg-no-repeat"
      style={{ 
        backgroundImage: "url('/acc.jpg')",
        backgroundSize: "80%",
        backgroundPosition: "center 10%" // First value is horizontal, second is vertical
      }}
    >
      <EmailInterface />
    </main>
  );
}