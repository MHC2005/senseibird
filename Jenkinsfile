pipeline {
  agent any
  options {
    timestamps()
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Semgrep Static Analysis') {
      steps {
        sh '''
          echo "Running Semgrep..."
          docker run --rm \
            -v "$(pwd)":/src \
            -w /src \
            semgrep/semgrep semgrep --config semgrep_rules.yaml . || true
        '''
      }
    }

    stage('Snyk Dependency Scan') {
      steps {
        withCredentials([string(credentialsId: 'SNYK_TOKEN', variable: 'SNYK_TOKEN')]) {
          sh '''
            echo "Running Snyk scan..."
            cd backend
            docker run --rm \
              -e SNYK_TOKEN=$SNYK_TOKEN \
              -v "$(pwd)":/project \
              snyk/snyk:python test --file=/project/requirements.txt || true
          '''
        }
      }
    }

  }
}
