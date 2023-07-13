import getConfigFile from '@/utils/getConfigFile';

const Run = async () => {
  const config = getConfigFile();
  console.log(config);
};

export default Run;
