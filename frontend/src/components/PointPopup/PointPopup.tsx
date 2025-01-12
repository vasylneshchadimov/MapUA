import React, {
  useState,
  MouseEvent,
  useEffect,
  memo,
  useCallback,
  useMemo,
  Suspense,
  lazy
} from 'react';
import { Box, Card, CardContent, Collapse, Typography } from '@mui/material';
import AlertDialog from 'components/AlertDialog';
import {
  selectIsUserAuthorized,
  selectUserRole
} from 'redux/memoizedSelectors/isUserAuthorizedSelectors';
import {
  selectArrayPhotos,
  selectAuthor,
  selectDescription,
  selectLocationId,
  selectPopUpLocationName,
  selectRaiting,
  selectVerificationStatus,
  selectLocationData,
  selectLocationFilters
} from 'redux/memoizedSelectors/popupLocationSelectors';
import {
  selectUserDataFavorite,
  selectUserDataVisited,
  selectUserId
} from 'redux/memoizedSelectors/userDataSelectors';
import {
  selectDeletedLocationsLoading,
  selectLocationIsDeleted
} from 'redux/memoizedSelectors/deleteLocationSelectors';
import {
  selectAuthorizedFilters,
  selectMapInfoBounds,
  selectMapInfoFilters,
  selectMapInfolocationName
} from 'redux/memoizedSelectors/mapInfoSelectors';
import { useTypedSelector } from 'redux/hooks/useTypedSelector';
import { useTypedDispatch } from 'redux/hooks/useTypedDispatch';
import { useForm, useFormState } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreatingLocationSchema } from 'utils/validation';
import EditLocation from 'components/EditLocation/EditLocation';
import { useTranslation } from 'react-i18next';
import CardComponent from './СardComponent/CardComponent';
import IconsComponent from './IconsComponent/IconsComponent';
import { StyledPopupButtonsWrapper } from '../design/StyledPopupButtonsWrapper';
import LocationImageCarousel from './LocationImageCarousel/LocationImageCarousel';
import CircularLoader from '../CircularLoader/CircularLoader';
import { LocationForm } from '../../../types';

const LazyCommentSection = lazy(
  () => import('components/BigPopup/CommentSection/CommentSection')
);

type Props = {
  toggleClose: Function;
};
const PointPopup = ({ toggleClose }: Props) => {
  const { t } = useTranslation();
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openDialog, setOpen] = React.useState(false);

  const handleCloseDialog = useCallback(() => setOpen(false), []);
  const handleOpenDialog = useCallback(() => setOpen(true), []);

  const {
    updatePopupLocationRating,
    toggleVisitedField,
    toggleFavoriteField,
    deleteLocation,
    fetchLocations,
    clearPopupLocation
  } = useTypedDispatch();

  const isAuthorized = useTypedSelector(selectIsUserAuthorized);

  const userId = useTypedSelector(selectUserId);
  const favorite = useTypedSelector(selectUserDataFavorite);
  const visited = useTypedSelector(selectUserDataVisited);
  const role = useTypedSelector(selectUserRole);
  const locationAuthorId = useTypedSelector(selectAuthor);

  const locationId = useTypedSelector(selectLocationId);

  const rating = useTypedSelector(selectRaiting);
  const verificationStatus = useTypedSelector(selectVerificationStatus);

  const locationName = useTypedSelector(selectPopUpLocationName);
  const description = useTypedSelector(selectDescription);
  const arrayPhotos = useTypedSelector(selectArrayPhotos);
  const selectedLocationFilters = useTypedSelector(selectLocationFilters);
  const isDeleted = useTypedSelector(selectLocationIsDeleted);

  const { control } = useForm<LocationForm>({
    mode: 'onBlur',
    defaultValues: { locationName, description },
    resolver: yupResolver(CreatingLocationSchema)
  });

  const { errors } = useFormState({
    control
  });

  const isFavorite = useMemo(
    () => favorite.includes(locationId),
    [favorite, locationId]
  );

  const isVisited = useMemo(
    () => visited.includes(locationId),
    [visited, locationId]
  );

  const handleExpandClick = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const handleFavoriteClick = useCallback(() => {
    if (isAuthorized) toggleFavoriteField(locationId);
  }, [isAuthorized, locationId]);

  const handleVisitedClick = useCallback(() => {
    if (isAuthorized) toggleVisitedField(locationId);
  }, [isAuthorized, locationId]);

  const handleDeleteClick = useCallback(() => {
    if (isAuthorized)
      deleteLocation(locationId, t('pointPopUp.locationDelete'));
    handleCloseDialog();
  }, [isAuthorized, locationId]);

  const bounds = useTypedSelector(selectMapInfoBounds);
  const searchName = useTypedSelector(selectMapInfolocationName);
  const selectedFilters = useTypedSelector(selectMapInfoFilters);
  const authorizedFilters = useTypedSelector(selectAuthorizedFilters);

  useEffect(() => {
    if (isDeleted && locationId) {
      fetchLocations(bounds, searchName, selectedFilters, authorizedFilters);
      toggleClose();
      clearPopupLocation();
    }
  }, [isDeleted]);

  const handleRating = useCallback(
    (e: MouseEvent<HTMLButtonElement>, type: 'likes' | 'dislikes') => {
      e.preventDefault();
      const updatedRating = { ...rating };
      if (rating[type].includes(userId)) {
        updatedRating[type] = updatedRating[type].filter(
          (value: any) => value !== userId
        );
      } else {
        updatedRating[type].push(userId);
      }

      const inverseType = type === 'likes' ? 'dislikes' : 'likes';

      if (rating[inverseType].includes(userId)) {
        updatedRating[inverseType] = updatedRating[inverseType].filter(
          (value: any) => value !== userId
        );
      }

      let status = verificationStatus;

      if (
        updatedRating.likes.length >= 5 &&
        verificationStatus === 'unverified'
      ) {
        status = 'waiting';
      } else if (
        updatedRating.likes.length < 5 &&
        verificationStatus === 'waiting'
      ) {
        status = 'unverified';
      }
      return updatePopupLocationRating(locationId, {
        rating: updatedRating,
        verificationStatus: status
      });
    },
    [verificationStatus, rating]
  );

  const editData = useCallback(() => {
    setShowEditPanel(true);
  }, []);

  const closeEditData = useCallback(() => {
    setShowEditPanel(false);
  }, []);

  const locationData = useTypedSelector(selectLocationData);

  const { loading } = locationData;

  const deleteLocationLoading = useTypedSelector(selectDeletedLocationsLoading);

  if (loading || deleteLocationLoading) {
    return <CircularLoader />;
  }

  return (
    <Box>
      {(showEditPanel && locationAuthorId?._id === userId) ||
      (showEditPanel && role === 'moderator') ||
      (showEditPanel && role === 'admin') ? (
        <EditLocation
          locationNamelocationName={locationName}
          closeEditData={closeEditData}
          descriptiondescription={description}
          locationId={locationId}
          selectedLocationFilters={selectedLocationFilters}
        />
      ) : (
        <Box>
          <AlertDialog
            openDialog={openDialog}
            transmittHandlerFunction={handleDeleteClick}
            handleCloseDialog={handleCloseDialog}
            deletingObject={t('pointPopUp.alertdialogmessagedata')}
          />
          <Card>
            <LocationImageCarousel
              arrayPhotos={arrayPhotos}
              locationName={locationName}
            />
            <Box>
              <Typography color="text.secondary" variant="h4" paddingX={5}>
                {locationName}
              </Typography>

              <StyledPopupButtonsWrapper>
                <IconsComponent
                  handleRating={handleRating}
                  handleFavoriteClick={handleFavoriteClick}
                  locationIsFavorite={isFavorite}
                  locationIsVisited={isVisited}
                  handleVisitedClick={handleVisitedClick}
                  editData={editData}
                  locationAuthorId={locationAuthorId}
                  handleDeleteClick={handleOpenDialog}
                  locationId={locationId}
                />
              </StyledPopupButtonsWrapper>
            </Box>

            <CardContent>
              <CardComponent
                handleExpandClick={handleExpandClick}
                expanded={expanded}
                showEditPanel={showEditPanel}
                control={control}
                errors={errors}
              />
            </CardContent>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Suspense fallback={<CircularLoader />}>
                <LazyCommentSection />
              </Suspense>
            </Collapse>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default memo(PointPopup);
