import JobDescriptionForm from '../components/JobDescriptionForm';

const JobDescription = () => {
  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Job Description</h1>
        <p className="page__subtitle">
          Enter the job details to match against uploaded resumes
        </p>
      </div>
      <JobDescriptionForm />
    </div>
  );
};

export default JobDescription;
