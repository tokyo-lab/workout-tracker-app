import * as React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from 'lodash';

export default function ExerciseSearch({ exercises = [], onChange }) {
  // Debounce the onChange handler to improve performance
  const handleChange = debounce((event, newValue) => {
    onChange(newValue);
  }, 300); // Adjust debounce delay as needed

  return (
    <Stack spacing={2} sx={{ width: 300 }}>
      <Autocomplete
        freeSolo
        id='exercise-search'
        disableClearable
        options={exercises.map(exercise => exercise.name)}
        onChange={handleChange}
        renderInput={params => (
          <TextField
            {...params}
            label='Search input'
            InputProps={{
              ...params.InputProps,
              type: 'search'
            }}
            sx={{ width: 850 }}
          />
        )}
      />
    </Stack>
  );
}
