import { useParams } from 'react-router';

const CheckSession = () => {
  const params = useParams();
  console.log(params);
};

export default CheckSession;
