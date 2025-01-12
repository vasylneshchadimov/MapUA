pipeline {
  agent any

  tools {
    nodejs 'Node'
  }

  environment {
    MONGO_DB = 'mapua'
    MONGO_HOSTNAME = 'mapua-cluster.uhph9.mongodb.net'
    BACKEND_PROD_URI = 'http://159.89.0.180:3001/api/'
  }

  stages {
    stage("build backend") {
      steps {
        withCredentials([usernamePassword(credentialsId: 'mongodb-user', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
          dir("backend") {
            sh 'echo "MONGO_PASSWORD=${PASSWORD}\nMONGO_USERNAME=${USER}\nMONGO_DB=${MONGO_DB}\nMONGO_HOSTNAME=${MONGO_HOSTNAME}" > .env'
          }
        }
        withCredentials([usernamePassword(credentialsId: 'docker-repo', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
          dir("backend") {
            sh 'docker build -t niukjs/mapua-backend:1.0 .'
            sh "echo $PASS | docker login -u $USER --password-stdin"
            sh "docker push niukjs/mapua-backend:1.0"
          }
        }
      }
    }
    stage("build frontend") {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-repo', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
          dir("frontend") {
            // As my docker-hub plan allows me only one private repo
            // i will use differ versioning
            sh 'echo "REACT_APP_API_URI=${BACKEND_PROD_URI}" > .env'
            sh 'docker build -t niukjs/mapua-backend:2.0 .'
            sh "echo $PASS | docker login -u $USER --password-stdin"
            sh "docker push niukjs/mapua-backend:2.0"
          }
        }
      }
    }
    stage("deploy") {
      steps {
        script {
          def dockerComposeCmd = "docker-compose -f docker-compose.yml up -d"
          // sshagent(['aws-ec2']) {
              sh "scp docker-compose.yml root@159.89.0.180:/root"
              sh "ssh -o StrictHostKeyChecking=no root@159.89.0.180 ${dockerComposeCmd}"
          // }
        }
      }
    }
  }
  // post {
  //   always {

  //   }
  //   success {

  //   }
  //   failure {

  //   }
  // }
}