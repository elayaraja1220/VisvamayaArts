export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      
      <div className="main-page-conatiner">

        {children}
      </div>
    </>
  );
}