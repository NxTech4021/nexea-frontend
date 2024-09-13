import React, { useState, useEffect, useCallback } from 'react';

import { Box, Card, Chip, Stack, Container, Typography, LinearProgress } from '@mui/material';

import { paths } from 'src/routes/paths';

import { getAllTemplates } from 'src/api/tickera';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

const Page = () => {
  const [templates, setTemplates] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const getTemplates = useCallback(async () => {
    setLoading(true);
    const data = await getAllTemplates();

    setTemplates(data?.templates);
    setLoading(false);
  }, []);

  useEffect(() => {
    getTemplates();
  }, [getTemplates]);

  return (
    <Container maxWidth="lg">
      <CustomBreadcrumbs
        heading="Whatsapp Template Management"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Whatsapp Template Management',
            href: paths.dashboard.whatsappTemplate.root,
          },
          { name: 'List' },
        ]}
      />

      {loading && <LinearProgress />}

      <Box display="grid" gridTemplateColumns="repeat(3,1fr)" gap={1} mt={2}>
        {templates?.length &&
          templates.map((template) => (
            <Card
              sx={{
                p: 2,
              }}
            >
              <Stack spacing={1} alignItems="start">
                <Chip label={template.id} size="small" color="primary" />
                <Typography color="text.secondary" variant="body2">
                  {template.data.replace('\n', '<br />')}
                </Typography>
              </Stack>
            </Card>
          ))}
      </Box>
    </Container>
  );
};

export default Page;
