L_GCLOUD_CONFIG="handy"
gcloud config configurations activate $L_GCLOUD_CONFIG
gcloud auth login --update-adc
gcloud auth application-default set-quota-project "$(gcloud config get project)"
echo "project is now '$(gcloud config get project)'"