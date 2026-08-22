import ResumeUpload from '../components/ResumeUpload';

const UploadResumes = () => {
  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Upload Resumes</h1>
        <p className="page__subtitle">
          Upload PDF resumes to extract text and prepare for skill matching
        </p>
      </div>
      <ResumeUpload />
    </div>
  );
};

export default UploadResumes;
