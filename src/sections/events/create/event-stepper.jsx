/* eslint-disable no-unused-vars */
import * as yup from 'yup';
import * as React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';

import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import { Box, Stack, Button, Container } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { endpoints, axiosInstance } from 'src/utils/axios';

import { useSettingsContext } from 'src/components/settings';
import FormProvider from 'src/components/hook-form/form-provider';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs/custom-breadcrumbs';

import EventAttendees from './steps/event-attendees';
import EventInformation from './steps/event-information';

const steps = ['Event Information', 'Upload CSV Attendees Data'];

export default function LinearStepper() {
  const settings = useSettingsContext();
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const router = useRouter();

  const navigate = useNavigate();

  const isStepOptional = (step) => step === 1;

  const isStepSkipped = (step) => skipped.has(step);

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      setActiveStep(0);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const schema = yup.object().shape({
    eventName: yup.string().required('Event name is required.'),
    eventDescription: yup.string().required('Event Description is Required'),
    personInCharge: yup.object().shape().required('Person In Charge is required'),
    startDate: yup.string().required('Start Date is required'),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      eventName: '',
      personInCharge: null,
      eventDescription: '',
      startDate: null,
      attendeesData: null,
    },
  });

  const { handleSubmit, watch, reset, setValue } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      formData.append('attendeesData', data.attendeesData);

      const response = await axiosInstance.post(endpoints.events.create, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      reset();
      router.push(paths.dashboard.events.root);
      toast.success('Event Created');
      await axiosInstance.get(endpoints.events.list);
    } catch (error) {
      if (error?.missingColumns) {
        toast.error(`Missing Columns: ${JSON.stringify(error?.missingColumns)}`);
        return;
      }
      toast.error('Error');
    }
  });

  const resetData = (data) => {
    reset(data);
  };

  const watchData = (data) => {
    const value = watch(data);
    return value;
  };

  const setData = (type, data) => {
    setValue(type, data);
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create new event"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Event',
            href: paths.dashboard.events.root,
          },
          { name: 'New Event' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {activeStep === 0 && <EventInformation />}
        {activeStep === 1 && (
          <EventAttendees watchData={watchData} resetData={resetData} setData={setData} />
        )}
        <Box mt={2}>
          <Stack direction="row" gap={1.5} alignItems="center" justifyContent="end">
            <Button
              variant="outlined"
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" size="small" onClick={onSubmit}>
                Submit
              </Button>
            ) : (
              <Button variant="contained" size="small" onClick={handleNext} type="button">
                Next
              </Button>
            )}
          </Stack>
        </Box>
      </FormProvider>
    </Container>
  );
}
