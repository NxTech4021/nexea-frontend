import { Helmet } from 'react-helmet-async';

import Employees from 'src/sections/four/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Employees</title>
      </Helmet>

      <Employees />
    </>
  );
}
