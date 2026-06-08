import LaunchBanner from "@/app/components/widgets/LaunchBanner";

export default function Home() {
  return (
    <div className="container">
      <h1>Deploy Hunt</h1>
      <p className="subtitle">
        This app is broken until you fix all five bugs. Follow{" "}
        <strong>DAY1.md</strong> and <strong>DAY2.md</strong> in the repo — not this page — for clues.
        When everything works, claim your certificate at <code>/certificate</code>.
      </p>
      <LaunchBanner />
    </div>
  );
}
