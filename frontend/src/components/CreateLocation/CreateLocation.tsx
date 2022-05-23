import {
  Input,
  TextareaAutosize,
  Typography,
  Button,
  Autocomplete,
  TextField
} from '@mui/material';
import axios from 'axios';
import React, { useState, useRef } from 'react';
import { latlngType } from '../../../types';
import { getFiltersForUser } from '../../static/mainFIlters';

type Props = {
  coordinate: latlngType;
};

const { REACT_APP_API_URI } = process.env;

const CreateLocation = ({ coordinate }: Props) => {
  const ref = useRef<null | HTMLInputElement>();

  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [filters, setFilters] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  // const [, setLinks] = useState<string[]>([]);

  const handleChange = (e: any): void => {
    setLocationName(e.target.value);
  };

  const handleChangeDescription = (e: any): void => {
    setDescription(e.target.value);
  };

  const accessToken = localStorage.getItem('accessToken');

  const onSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('locationName', locationName);
      formData.append('description', description);
      formData.append('coordinates', String(coordinate.lat));
      formData.append('coordinates', String(coordinate.lng));
      formData.append('filters', String(filters));
      formData.append('image', files[0]);

      await axios.post(`${REACT_APP_API_URI}locations/create`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setLocationName('');
      setDescription('');
      setFilters('');
      if (ref.current) {
        ref.current.value = '';
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onChangeAutocomplete = (e: any, value: any) => {
    setFilters(value);
  };

  const handleFilesChange = (e: any) => {
    const { files: filesLst } = e.currentTarget;
    const filesListArr = [];

    if (filesLst) {
      for (let i = 0; i < filesLst.length; i += 1) {
        filesListArr.push(filesLst[i]);
      }

      setFiles(filesListArr);
    }
  };

  // const handleFormSubmit = async () => {
  //   const formData = new FormData();
  //
  //   const urls = await Promise.all(
  //     files.map(async file => {
  //       formData.set('file', file);
  //       const res = await fetch(`${process.env.REACT_APP_API_URI}uploadImage`, {
  //         method: 'POST',
  //         body: formData
  //       });
  //
  //       return res.json();
  //     })
  //   );
  //   setLinks(urls.map(itm => itm.url));
  // };

  return (
    <form
      onSubmit={onSubmit}
      style={{
        width: '300px',
        height: '600px',
        textAlign: 'center',
        marginTop: '150px'
      }}
    >
      <Typography>Creating location</Typography>

      {/* <img
        src=""
        alt=""
        style={{
          width: '200px',
          height: '200px',
          backgroundColor: 'white'
        }}
      /> */}
      <Input
        type="text"
        value={locationName}
        onChange={handleChange}
        placeholder="enter location name"
      />

      <TextareaAutosize
        aria-label="minimum height"
        value={description}
        onChange={handleChangeDescription}
        minRows={3}
        placeholder="Minimum 3 rows"
        style={{ width: 200 }}
      />

      <Autocomplete
        multiple
        id="tags-outlined"
        options={getFiltersForUser()}
        getOptionLabel={option => option}
        filterSelectedOptions
        onChange={(e, values) => onChangeAutocomplete(e, values)}
        renderInput={params => (
          <TextField
            {...params}
            value={filters}
            label="filterSelectedOptions"
            placeholder="Favorites"
          />
        )}
      />

      <Input
        id="contained-button-file"
        type="file"
        onChange={e => handleFilesChange(e)}
        ref={ref}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* <Button variant="contained" component="span" onClick={handleFormSubmit}> */}
        {/*  Upload */}
        {/* </Button> */}
        <Button variant="contained" type="submit">
          Done and submit
        </Button>
      </div>
    </form>
  );
};

export default CreateLocation;