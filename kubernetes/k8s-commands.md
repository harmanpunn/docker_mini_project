### kubectl apply commands in order

    kubectl apply -f mongo-secret.yaml
    kubectl apply -f mongo.yaml
    kubectl apply -f mongo-configmap.yaml
    kubectl apply -f mongo-express.yaml

### kubectl get commands

    kubectl get pod
    kubectl get pod --watch
    kubectl get pod -o wide
    kubectl get pod
    kubectl get secret
    kubectl get all | grep mongodb

### kubectl debugging commands

    kubectl describe pod mongodb-deployment-xxxxxx
    kubectl describe service mongodb-service
    kubectl logs mongo-express-xxxxxx

### give a URL to external service in minikube

    minikube service mongo-express-service

### delete the deployment and service

    kubectl delete -f mongo.yaml
    kubectl delete -f mongo-secret.yaml
    kubectl delete -f mongo-express.yaml
    kubectl delete -f mongo-configmap.yaml

    kubectl delete service mongo-express-service
