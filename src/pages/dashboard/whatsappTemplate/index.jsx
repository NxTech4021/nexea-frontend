import { Helmet } from 'react-helmet-async';

import WhatsappTemplate from 'src/sections/whatsappTemplate/view/page';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Whatsapp Template</title>
      </Helmet>

      <WhatsappTemplate />
    </>
  );
}
